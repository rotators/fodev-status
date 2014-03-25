package FOstatus;

use Date::Calc qw( Add_Delta_Days Date_to_Days Date_to_Time );
use File::Basename qw( dirname );
use File::Path qw( make_path );
use JSON qw( encode_json decode_json );

BEGIN {
    use Exporter 'import';
    our( @ISA, @EXPORT, @EXPORT_OK, %EXPORT_TAGS );
    @ISA = qw( Exporter );

    @EXPORT = @EXPORT_OK = qw(
		&ymd_to_time
    );
};

sub new
{
	my( $class, %options ) = @_;
	my $self = {
		Config => undef
	};

	bless( $self, $class );
	return( $self );
}

sub LoadConfig($$)
{
	my( $self, $filename ) = @_;

	my $json = undef;
	if( open( my $file, '<', $filename ))
	{
		local $/;
		my $json_txt = <$file>;
		close( $file );
		$json = eval { decode_json( $json_txt ); };
	}

	return( 0 ) if( !defined( $json ));
	return( 0 ) if( !exists( $json->{fonline} ));
	return( 0 ) if( !exists( $json->{fonline}{config} ));

	$self->{Config} = $json->{fonline}{config};

	return( 1 );
}

sub GetPath($$;%)
{
	my( $self, $name, %args ) = @_;
	my $result = undef;

	if( defined($self->{Config}) && exists($self->{Config}->{files}) )
	{
		if( exists($self->{Config}->{files}{$name}) )
		{
			$result = $self->{Config}->{files}{$name};
			if( exists($self->{Config}->{dirs}) )
			{
				foreach my $dir ( keys( $self->{Config}->{dirs} ))
				{
					my $from = '{DIR:'.$dir.'}';
					my $to = $self->{Config}->{dirs}{$dir};
					$result =~ s!$from!$to!g;
				}
			}
			if( scalar(keys(%args)) > 0 )
			{
				foreach my $key ( keys( %args ))
				{
					my $from = '{'.$key.'}';
					my $to = $args{$key};
					$result =~ s!$from!$to!g;
				}
			}
		}
	}

	return( $result );
}

sub SaveJSON($$$;$)
{
	my( $self, $db, $filename, $pretty ) = @_;

	my( $old_content, $new_content ) = ( '', '' );

	if( open( my $file, '<', $filename ))
	{
		local $/;
		$old_content = <$file>;
		close( $file );
	}

	if( $pretty )
		{ $new_content = JSON->new->pretty->encode($db); }
	else
		{ $new_content = encode_json( $db ); }

	return( 0 ) if( $old_content eq $new_content );

	make_path( dirname( $filename ));
	if( open( my $file, '>', $filename ))
	{
		printf( $file $new_content );
		close( $file );
		return( 1 );
	}

	return( 0 );
}

sub YMDHashToArray($$)
{
	my( $self, $db ) = @_;

	my @content;

	my $last_day = undef;
	foreach my $year ( sort{$a <=> $b} keys($db) )
	{
		next if( !($year =~ /^[0-9]+$/ ));
		foreach my $month ( sort{$a <=> $b} keys($db->{$year}) )
		{
			next if( !($month =~ /^[0-9]+$/ ));
			foreach my $day ( sort{$a <=> $b} keys($db->{$year}{$month}) )
			{
				next if( !($day =~ /^[0-9]+$/ ));
				
				if( defined($last_day) )
				{
					my $this_day = Date_to_Days( $year, $month, $day );
					while( $this_day - $last_day != 1 )
					{
						my( $lost_year, $lost_month, $lost_day ) = Add_Delta_Days( 1, 1, 1, $last_day );
						$last_day = Date_to_Days( $lost_year, $lost_month, $lost_day );
						my @result = ( $self->Timestamp( $lost_year, $lost_month, $lost_day ), undef );
						push( @content, \@result );
					}
				}
				$last_day = Date_to_Days( $year, $month, $day );
				my $online = $db->{$year}{$month}{$day};
				$online = int($online);
				$online = undef if( $online < 0 );
				my @result = ( int($self->Timestamp( $year, $month, $day )), $online );
				push( @content, \@result );
			}
		}
	}

	return( @content );
}

sub Timestamp($$$)
{
	my( $self, $year, $month, $day ) = @_;
	return( Date_to_Time( $year, $month, $day, 0, 0, 0 ));
}

1;
